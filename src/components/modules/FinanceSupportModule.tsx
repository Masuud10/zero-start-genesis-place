
import React from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const FinanceSupportModule = () => {
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Contact Support</h3>
            <p className="text-muted-foreground">Having an issue? Let us know.</p>
            <div className="space-y-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input id="support-subject" placeholder="e.g., Issue with payment processing" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="support-description">Description</Label>
                <Textarea id="support-description" placeholder="Please describe the issue in detail..." rows={6} />
            </div>
            <Button>Submit Ticket</Button>
        </div>
    )
};
export default FinanceSupportModule;
