"use server";

import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";
import { calculateLOCUS } from "@/app/lib/locus";

export async function submitQuestionnaire(formData: any) {
  try {
    const scores = {
      scoreSafety: parseInt(formData.scoreSafety),
      scoreFunctioning: parseInt(formData.scoreFunctioning),
      scorePhysicalDrug: parseInt(formData.scorePhysicalDrug),
      scoreEnvironment: parseInt(formData.scoreEnvironment),
      scoreStress: parseInt(formData.scoreStress),
      scoreReadiness: parseInt(formData.scoreReadiness),
    };
    const hasRehabBasket = formData.rehabBasket === 'כן';

    const questionnaire = await prisma.questionnaire.create({
      data: {
        fullName: formData.fullName,
        idNumber: formData.idNumber,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        city: formData.city,
        hmo: formData.hmo,
        language: formData.language,
        maritalStatus: formData.maritalStatus,
        hasChildren: formData.hasChildren === 'כן',
        childrenAges: formData.childrenAges,
        employmentStatus: formData.employmentStatus,
        receivesDisability: formData.receivesDisability === 'כן',
        militaryService: formData.militaryService,
        
        ...scores,

        isFirstVisit: formData.isFirstVisit === 'ראשונה',
        pastTreatment: formData.pastTreatment,
        rehabBasket: hasRehabBasket,
        hasCoordinator: formData.hasCoordinator === 'כן',
        referringSource: formData.referringSource,
        reasonForReferral: formData.reasonForReferral,
        
        hasDrugUse: formData.hasDrugUse === 'כן',
        drugType: formData.drugType,
        drugFrequency: formData.drugFrequency,
        hasAlcoholUse: formData.hasAlcoholUse === 'כן',
        alcoholType: formData.alcoholType,
        alcoholFrequency: formData.alcoholFrequency,
        
        expectations: formData.expectations,
        notes: formData.notes,
        
        status: "NEW",
        priority: 0 
      }
    });

    // Create auto-recommendation
    const recommendation = calculateLOCUS(scores, hasRehabBasket);
    await prisma.recommendation.create({
      data: {
        questionnaireId: questionnaire.id,
        ...recommendation
      }
    });

    revalidatePath("/dashboard");
    return { success: true, id: questionnaire.id };
  } catch (error) {
    console.error("Failed to submit questionnaire:", error);
    return { success: false, error: "Submission failed" };
  }
}
export async function updateQuestionnaire(id: string, formData: any) {
  try {
    const scores = {
      scoreSafety: parseInt(formData.scoreSafety),
      scoreFunctioning: parseInt(formData.scoreFunctioning),
      scorePhysicalDrug: parseInt(formData.scorePhysicalDrug),
      scoreEnvironment: parseInt(formData.scoreEnvironment),
      scoreStress: parseInt(formData.scoreStress),
      scoreReadiness: parseInt(formData.scoreReadiness),
    };
    const hasRehabBasket = formData.rehabBasket === 'כן';

    await prisma.questionnaire.update({
      where: { id },
      data: {
        fullName: formData.fullName,
        idNumber: formData.idNumber,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
        city: formData.city,
        hmo: formData.hmo,
        language: formData.language,
        maritalStatus: formData.maritalStatus,
        hasChildren: formData.hasChildren === 'כן',
        childrenAges: formData.childrenAges,
        employmentStatus: formData.employmentStatus,
        receivesDisability: formData.receivesDisability === 'כן',
        militaryService: formData.militaryService,
        
        ...scores,

        isFirstVisit: formData.isFirstVisit === 'ראשונה',
        pastTreatment: formData.pastTreatment,
        rehabBasket: hasRehabBasket,
        hasCoordinator: formData.hasCoordinator === 'כן',
        referringSource: formData.referringSource,
        reasonForReferral: formData.reasonForReferral,

        hasDrugUse: formData.hasDrugUse === 'כן',
        drugType: formData.drugType,
        drugFrequency: formData.drugFrequency,
        hasAlcoholUse: formData.hasAlcoholUse === 'כן',
        alcoholType: formData.alcoholType,
        alcoholFrequency: formData.alcoholFrequency,

        expectations: formData.expectations,
        notes: formData.notes
      }
    });

    // Re-calculate LOCUS if scores changed
    const recommendation = calculateLOCUS(scores, hasRehabBasket);
    await prisma.recommendation.create({
      data: {
        questionnaireId: id,
        ...recommendation
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update questionnaire:", error);
    return { success: false, error: "Update failed" };
  }
}
