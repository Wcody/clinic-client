import type { BQHolidayEntityType } from "@/api/system/holiday";

interface FormItemProps extends BQHolidayEntityType {
  title: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
