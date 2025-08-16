import { z } from 'zod';

export const aliasSchema = z.union([
    // Email validation
    z.string().email('Invalid email address'),
    // Phone validation (E.164 format)
    z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number (E.164 format)'),
    // Handle validation
    z.string().regex(/^@[a-z0-9._-]{3,20}$/, 'Handle must be @ followed by 3-20 alphanumeric characters')
]);

export const amountSchema = z.string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be a positive number')
    .refine(val => parseFloat(val) <= 999999, 'Amount too large')
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val), 'Amount must have max 2 decimal places');

export const noteSchema = z.string()
    .max(120, 'Note must be 120 characters or less')
    .optional();

export const teamMemberSchema = z.object({
    address: z.string().min(42, 'Invalid address'),
    alias: z.string().optional(),
    share: z.number().min(0).max(100)
});

export const teamSchema = z.object({
    alias: z.string().regex(/^@[a-z0-9._-]{3,20}$/, 'Invalid team alias'),
    members: z.array(teamMemberSchema)
        .min(2, 'Team must have at least 2 members')
        .max(10, 'Team cannot exceed 10 members')
        .refine(members => {
            const totalShare = members.reduce((sum, member) => sum + member.share, 0);
            return Math.abs(totalShare - 100) < 0.01; // Allow small floating point errors
        }, 'Total share must equal 100%')
});

export const sendPaymentSchema = z.object({
    alias: aliasSchema,
    amount: amountSchema,
    note: noteSchema
});

export type AliasInput = z.infer<typeof aliasSchema>;
export type AmountInput = z.infer<typeof amountSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type SendPaymentInput = z.infer<typeof sendPaymentSchema>;
