import { z } from 'zod';

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Địa chỉ email không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    organizationName: z
      .string()
      .min(2, 'Tên tổ chức phải có ít nhất 2 ký tự'),
    contactPerson: z
      .string()
      .min(2, 'Tên người đại diện phải có ít nhất 2 ký tự'),
    email: z
      .string()
      .min(1, 'Email không được để trống')
      .email('Địa chỉ email không hợp lệ'),
    contactPhone: z
      .string()
      .min(9, 'Số điện thoại không hợp lệ')
      .max(11, 'Số điện thoại không hợp lệ')
      .regex(/^[0-9]+$/, 'Số điện thoại chỉ được chứa chữ số'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
