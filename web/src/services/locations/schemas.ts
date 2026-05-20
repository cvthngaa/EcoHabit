import { z } from 'zod';

// ─── Location Form ────────────────────────────────────────────────────────────
export const locationFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên điểm thu gom phải có ít nhất 2 ký tự')
    .max(100, 'Tên điểm thu gom quá dài'),
  address: z
    .string()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  contactPhone: z
    .string()
    .regex(/^[0-9]{9,11}$/, 'Số điện thoại không hợp lệ (9–11 chữ số)')
    .optional()
    .or(z.literal('')),
  latitude: z
    .number({ error: 'Latitude phải là số' })
    .min(-90, 'Latitude phải từ -90 đến 90')
    .max(90, 'Latitude phải từ -90 đến 90')
    .optional(),
  longitude: z
    .number({ error: 'Longitude phải là số' })
    .min(-180, 'Longitude phải từ -180 đến 180')
    .max(180, 'Longitude phải từ -180 đến 180')
    .optional(),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;
