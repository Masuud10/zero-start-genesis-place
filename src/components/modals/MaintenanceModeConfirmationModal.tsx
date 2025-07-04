import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Users,
  Shield,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface MaintenanceModeConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (message: string) => void;
  isLoading?: boolean;
}

const MaintenanceModeConfirmationModal: React.FC<
  MaintenanceModeConfirmationModalProps
> = ({ isOpen, onClose, onConfirm, isLoading = false }) => {
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "System is currently under maintenance. Please try again later."
  );
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm(maintenanceMessage);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Enable Maintenance Mode
          </DialogTitle>
          <DialogDescription className="text-base">
            This action will restrict access to all users except EduFam
            Administrators.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warning Alert */}
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <strong>Critical Action:</strong> Enabling maintenance mode will
              immediately block access for all users except EduFam
              Administrators.
            </AlertDescription>
          </Alert>

          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <h4 className="font-semibold text-red-800">Will Be Blocked</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Principals</li>
                <li>• Teachers</li>
                <li>• Parents</li>
                <li>• Finance Officers</li>
                <li>• School Owners</li>
                <li>• All other user roles</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-green-800">
                  Will Retain Access
                </h4>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• EduFam Administrators</li>
                <li>• System Settings</li>
                <li>• Maintenance Controls</li>
                <li>• Emergency Access</li>
              </ul>
            </div>
          </div>

          {/* Maintenance Message */}
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Enter the message users will see during maintenance..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              This message will be displayed to all blocked users when they try
              to access the system.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <input
              type="checkbox"
              id="confirm-maintenance"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <Label
              htmlFor="confirm-maintenance"
              className="text-sm text-yellow-800"
            >
              I understand that enabling maintenance mode will immediately block
              access for all users except EduFam Administrators. I have notified
              relevant stakeholders about this maintenance window.
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!confirmed || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enabling...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Enable Maintenance Mode
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceModeConfirmationModal;
