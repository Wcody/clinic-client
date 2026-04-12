import type {
  BQRecordEntityType,
  Diagnosis,
  ShoushuItem,
  ZhongzhengItem
} from "@/api/cm/record";

interface FormItemProps extends BQRecordEntityType {
  title: string;
  initKind: number;
  caption: string;
}
interface FormProps {
  formInline: FormItemProps;
}

interface ZDFormProps {
  initKind: number;
  formInline: Diagnosis;
}

interface SSFormProps {
  initKind: number;
  formInline: ShoushuItem;
}

interface ZZFormProps {
  initKind: number;
  formInline: ZhongzhengItem;
}

export type { FormItemProps, FormProps, ZDFormProps, SSFormProps, ZZFormProps };
