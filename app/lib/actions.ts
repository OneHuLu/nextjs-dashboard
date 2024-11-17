"use server";
// 类型转化库 Zod 的导入，用于数据验证和类型定义
import { z } from "zod";
// sql
import { sql } from "@vercel/postgres";
// 更新缓存路径
import { revalidatePath } from "next/cache";
// 路由跳转
import { redirect } from "next/navigation";
// 使用 Zod 定义了一个对象类型 Schema，描述了表单数据的结构及其验证规则
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});

// 创建一个新的类型，去掉 id 和 date 字段
const CreateInvoice = FormSchema.omit({ id: true, date: true });

/**
 * 创建发票信息操作
 * @param formData
 */
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];
  console.log(`(${customerId}, ${amountInCents}, ${status}, ${date})`);
  await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  // 清空原本发票页面缓存信息，后台更新
  revalidatePath("/dashboard/invoices");
  // 页面跳转
  redirect("/dashboard/invoices");
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
/**
 * 更新发票信息操作
 * @param id
 * @param formData
 */
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
  });
  const amountInCents = amount * 100;
  await sql`
  UPDATE invoices
  SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
  WHERE id = ${id}
`;
  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`
  DELETE FROM invoices
  WHERE id = ${id}
  `;
  revalidatePath("/dashboard/invoices");
}
