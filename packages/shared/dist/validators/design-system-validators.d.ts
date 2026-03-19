import { z } from 'zod';
export declare const CreateDesignSystemSchema: z.ZodObject<{
    projectId: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    tokens: z.ZodObject<{
        colors: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            darkValue: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }, {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }>, "many">;
        typography: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            fontFamily: z.ZodString;
            fontSize: z.ZodNumber;
            fontWeight: z.ZodNumber;
            lineHeight: z.ZodNumber;
            letterSpacing: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }, {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }>, "many">;
        spacing: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodNumber;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            value: number;
            description?: string | undefined;
        }, {
            name: string;
            value: number;
            description?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        colors: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[];
        typography: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[];
        spacing: {
            name: string;
            value: number;
            description?: string | undefined;
        }[];
    }, {
        colors: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[];
        typography: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[];
        spacing: {
            name: string;
            value: number;
            description?: string | undefined;
        }[];
    }>;
    version: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    projectId: string;
    tokens: {
        colors: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[];
        typography: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[];
        spacing: {
            name: string;
            value: number;
            description?: string | undefined;
        }[];
    };
    version: string;
    description?: string | undefined;
}, {
    name: string;
    projectId: string;
    tokens: {
        colors: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[];
        typography: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[];
        spacing: {
            name: string;
            value: number;
            description?: string | undefined;
        }[];
    };
    description?: string | undefined;
    version?: string | undefined;
}>;
export declare const UpdateDesignSystemSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    tokens: z.ZodOptional<z.ZodObject<{
        colors: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            darkValue: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }, {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }>, "many">>;
        typography: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            fontFamily: z.ZodString;
            fontSize: z.ZodNumber;
            fontWeight: z.ZodNumber;
            lineHeight: z.ZodNumber;
            letterSpacing: z.ZodOptional<z.ZodNumber>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }, {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }>, "many">>;
        spacing: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodNumber;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            value: number;
            description?: string | undefined;
        }, {
            name: string;
            value: number;
            description?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        colors?: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[] | undefined;
        typography?: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[] | undefined;
        spacing?: {
            name: string;
            value: number;
            description?: string | undefined;
        }[] | undefined;
    }, {
        colors?: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[] | undefined;
        typography?: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[] | undefined;
        spacing?: {
            name: string;
            value: number;
            description?: string | undefined;
        }[] | undefined;
    }>>;
    version: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    tokens?: {
        colors?: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[] | undefined;
        typography?: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[] | undefined;
        spacing?: {
            name: string;
            value: number;
            description?: string | undefined;
        }[] | undefined;
    } | undefined;
    version?: string | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    tokens?: {
        colors?: {
            name: string;
            value: string;
            description?: string | undefined;
            darkValue?: string | undefined;
        }[] | undefined;
        typography?: {
            name: string;
            fontFamily: string;
            fontSize: number;
            fontWeight: number;
            lineHeight: number;
            description?: string | undefined;
            letterSpacing?: number | undefined;
        }[] | undefined;
        spacing?: {
            name: string;
            value: number;
            description?: string | undefined;
        }[] | undefined;
    } | undefined;
    version?: string | undefined;
}>;
export type CreateDesignSystemInput = z.infer<typeof CreateDesignSystemSchema>;
export type UpdateDesignSystemInput = z.infer<typeof UpdateDesignSystemSchema>;
//# sourceMappingURL=design-system-validators.d.ts.map