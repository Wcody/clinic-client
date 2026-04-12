import type { BQMenuEntityType } from "@/api/system/menu";

interface FormItemProps extends BQMenuEntityType {
  higherMenuOptions: Record<string, unknown>[];
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
