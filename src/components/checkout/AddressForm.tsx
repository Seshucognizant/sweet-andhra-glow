import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface AddressFormProps {
  title: string;
  address: Address;
  onAddressChange: (address: Address) => void;
  errors?: Record<string, string>;
}

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export const AddressForm = ({ title, address, onAddressChange, errors = {} }: AddressFormProps) => {
  const handleInputChange = (field: keyof Address, value: string) => {
    onAddressChange({
      ...address,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${title}-fullName`}>Full Name *</Label>
            <Input
              id={`${title}-fullName`}
              value={address.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter full name"
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <span className="text-sm text-destructive">{errors.fullName}</span>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${title}-phone`}>Phone Number *</Label>
            <Input
              id={`${title}-phone`}
              value={address.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+91 9876543210"
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <span className="text-sm text-destructive">{errors.phone}</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-addressLine1`}>Address Line 1 *</Label>
          <Input
            id={`${title}-addressLine1`}
            value={address.addressLine1}
            onChange={(e) => handleInputChange('addressLine1', e.target.value)}
            placeholder="House number, street name"
            className={errors.addressLine1 ? 'border-destructive' : ''}
          />
          {errors.addressLine1 && (
            <span className="text-sm text-destructive">{errors.addressLine1}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-addressLine2`}>Address Line 2</Label>
          <Input
            id={`${title}-addressLine2`}
            value={address.addressLine2 || ''}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
            placeholder="Area, landmark (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${title}-city`}>City *</Label>
            <Input
              id={`${title}-city`}
              value={address.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City"
              className={errors.city ? 'border-destructive' : ''}
            />
            {errors.city && (
              <span className="text-sm text-destructive">{errors.city}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${title}-state`}>State *</Label>
            <select
              id={`${title}-state`}
              value={address.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.state ? 'border-destructive' : ''}`}
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && (
              <span className="text-sm text-destructive">{errors.state}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${title}-pincode`}>Pincode *</Label>
            <Input
              id={`${title}-pincode`}
              value={address.pincode}
              onChange={(e) => handleInputChange('pincode', e.target.value)}
              placeholder="000000"
              maxLength={6}
              className={errors.pincode ? 'border-destructive' : ''}
            />
            {errors.pincode && (
              <span className="text-sm text-destructive">{errors.pincode}</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${title}-country`}>Country</Label>
          <Input
            id={`${title}-country`}
            value={address.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="India"
            disabled
            className="bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
};