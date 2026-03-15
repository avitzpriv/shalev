import prisma from "@/app/lib/db";
import { notFound, redirect } from "next/navigation";
import { getConfig } from "@/app/lib/config";
import QuestionnaireForm from "@/app/components/QuestionnaireForm";
import { auth } from "@/app/lib/auth";
import Link from "next/link";

export default async function EditQuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const submission = await prisma.questionnaire.findUnique({
    where: { id }
  });

  if (!submission) notFound();

  const hmoOptions = await getConfig("hmo-options", "כללית, מכבי, מאוחדת, לאומית");
  const referralReasons = await getConfig("referral-reasons", "דיכאון, חרדה, פוסט טראומה, משבר חיים, ללא אבחנה");

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href={`/dashboard/${id}`} className="btn">&larr; ביטול וחזרה</Link>
        <h1>עריכת פרטי פנייה: {submission.fullName}</h1>
        <div></div>
      </div>
      <QuestionnaireForm 
        hmoOptions={hmoOptions} 
        referralReasons={referralReasons} 
        initialData={submission}
        isEdit={true}
      />
    </div>
  );
}
