export interface Maintenance {
    id: number;
    description: string;
    cost?: number;
    startDate: string;
    endDate?: string;
    status: string;
}

export interface Tool {
    id: number;
    name?: string;
    toolTypeId: number;
    rfid?: string;
    serialNumber?: string;
    status: 'available' | 'in_use' | 'in_maintenance' | 'booked';
    condition: 'new' | 'good' | 'fair' | 'poor';
    currentOwnerId?: number;
    purchaseDate?: Date | null;
    cost?: number | null;
    warrantyEndDate?: Date;
    usageCount: number;
    locationId?: number | null;
    manufacturerId?: number | null;
    instanceImage?: string;
    description?: string;
} 