
import React from 'react';
import CreateSupportTicketForm from './CreateSupportTicketForm';

const FinanceSupportModule = () => {
    return (
        <div className="space-y-4 max-w-2xl mx-auto py-4">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-semibold">Contact Support</h3>
                <p className="text-muted-foreground">Having an issue? Let us know and we'll get back to you.</p>
            </div>
            <CreateSupportTicketForm />
        </div>
    )
};
export default FinanceSupportModule;
