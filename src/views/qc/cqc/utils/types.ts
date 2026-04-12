import type { BQAnnotationEntityType } from "@/api/cm/annotation";
import type { BQRecordEntityType } from "@/api/cm/record";
import type { Ref } from "vue";

interface FormItemProps extends BQRecordEntityType {
  title: string;
  initKind: number;
  caption: string;
  selectNodeId?: string | number;
}

interface FormProps {
  formInline: FormItemProps;
  headerRef?: Ref;
  contentRef?: Ref;
  headerInfo?: any;
  otherInfo?: any;
  leftSelectValue?: number;
  totalPoints?: number;
}

interface KindTree {
  eid: string;
  type: number;
  label: string;
  status: boolean;
  hasManual: boolean;
  kindId?: string;
  url?: string;
  page?: number;
  children?: KindTree[];
}

interface UploadFormProps {
  formInline: {
    recordId: string;
    uploadType: number;
    initKind: number;
    kindId?: string;
    fileList?: any[];
  };
}

interface AnnotationFormItem extends BQAnnotationEntityType {}

interface AnnotationFormProps {
  formInline: AnnotationFormItem;
}

export type {
  FormItemProps,
  FormProps,
  KindTree,
  UploadFormProps,
  AnnotationFormItem,
  AnnotationFormProps
};
