import { getConfig } from "@/app/lib/config";
import QuestionnaireForm from "@/app/components/QuestionnaireForm";

export default async function PatientPage() {
  const hmoOptions = await getConfig("hmo-options", "כללית, מכבי, מאוחדת, לאומית");
  const referralReasons = await getConfig("referral-reasons", "חרדה, דיכאון, טראומה, משבר חיים, אחר");

  return <QuestionnaireForm hmoOptions={hmoOptions} referralReasons={referralReasons} />;
}
