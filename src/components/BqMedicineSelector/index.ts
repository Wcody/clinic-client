import medicineSelector from "./src/MedicineSelector.vue";
import { withInstall } from "@pureadmin/utils";

export const BqMedicineSelector = withInstall(medicineSelector);
export type { MedicineItem } from "./src/MedicineSelector.vue";

export default BqMedicineSelector;
