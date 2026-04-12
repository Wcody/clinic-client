import type { BQCategoryMappingEntityType } from "@/api/system/category";

interface FormItemProps extends BQCategoryMappingEntityType {
  title: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
