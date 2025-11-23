export interface ClassificationTableProps {
    classifications: ClientClassification[];
}

export interface ClientClassification {
    clientName: string;
    email: string;
    phone?: string;
    meetingDate?: string;
    assignedSalesperson?: string;
    isClosed?: boolean;
    industry: string;
    leadSource: string;
    interactionVolume: string;
    mainPainPoint: string;
    techMaturity: string;
    urgency: string;
    confidence: number;
}