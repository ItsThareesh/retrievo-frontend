import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Instagram } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface UserOnboardingData {
  phoneNumber: string;
  hostel: string;
  instaId: string;
}

interface FirstLoginModalProps {
  isOpen: boolean;
  onSubmit: (data: UserOnboardingData) => Promise<void> | void;
}

export default function FirstLoginModal({ isOpen, onSubmit }: FirstLoginModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [hostel, setHostel] = useState<'Boys' | 'Girls' | ''>('');
  const [instaId, setinstaId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountrycode] = useState("+91")
  
  const codes = [
        { value: "+91", label: "IN" },
        { value: "+971", label: "UAE" },
        { value: "+966", label: "SA" },
        { value: "+974", label: "QA" },
        { value: "+965", label: "KW" },
        { value: "+968", label: "OM" },
        { value: "+973", label: "BH" },
        { value: "+1", label: "US/CA" },
        { value: "+44", label: "UK" },
        { value: "+61", label: "AU" },
        { value: "+64", label: "NZ" },
        { value: "+353", label: "IE" },
        { value: "+49", label: "DE" },
    ]

  if (!isOpen) return null;

  useEffect(()=> { // scroll-lock
        if(isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phoneNumber.length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!phoneNumber.trim() || !hostel) {
      setError('Please fill in all fields.');
      return;
    }
    const fullPhoneNumber = `${countryCode}${phoneNumber.trim()}`; // countryCode + number

    try {
      setIsSubmitting(true);
      await onSubmit({ phoneNumber: fullPhoneNumber, hostel, instaId});
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // backdrop-blur
    <div className="fixed inset-0 z-50 h-screen flex items-center justify-center bg-black/60 backdrop-blur-md p-4">

      <Card className="w-full max-w-lg shadow-2xl px-2 py-10 flex flex-col">
        
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl text-primary">Welcome Aboard!</CardTitle>
          <CardDescription>
            We need a few details to set up your profile.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {/* Phone Input */}
            <div className="space-y-2 flex flex-col gap-3">
                <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Phone Number <span className="text-red-500">*</span>
                </label>
              <div className="flex flex-row items-center gap-2">
                <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-[70px] [font-variant-numeric:tabular-nums] cursor-pointer"
                            >
                                <span className="w-[28px] text-center">
                                    {countryCode}
                                </span>
                                <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="min-w-[200px]">
                            {codes.map((item) => (
                                <DropdownMenuItem
                                    key={item.value}
                                    onSelect={() => setCountrycode(item.value)}
                                    className="cursor-pointer flex justify-between"
                                >
                                    <div>{item.value}</div>
                                    <div>{item.label}</div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Input
                        className="flex-1 min-w-0"
                        placeholder="xxxxxxxxxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="flex flex-row gap-2 items-center mb-3">
                <Instagram size={18}/>
                    <Input
                        className="flex-1 min-w-0"
                        placeholder="Instagram ID (optional)"
                        value={instaId}
                        onChange={(e) => setinstaId(e.target.value)}
                    />
                </div>
            </div>

            {/* Hostel Select */}
            <div className="space-y-2 flex flex-col gap-2">
              <label htmlFor="hostel" className="text-sm font-medium leading-none">
                Select Hostel <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-row gap-4 w-full">
                {/* BOYS BUTTON */}
                <Button
                  type="button" // Prevents form submission
                  onClick={() => setHostel('Boys')}
                  variant={hostel === 'Boys' ? 'default' : 'outline'}
                  className="h-10 text-base flex flex-grow cursor-pointer"
                >
                  Boys
                </Button>

                {/* GIRLS BUTTON */}
                <Button
                  type="button" // Prevents form submission
                  onClick={() => setHostel('Girls')}
                  variant={hostel === 'Girls' ? 'default' : 'outline'}
                  className="h-10 text-base flex flex-grow cursor-pointer"
                >
                  Girls
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="text-sm font-medium text-red-500 text-center p-2 rounded">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center mt-3 rounded-md text-sm font-medium  transition-colors disabled:pointer-events-none disabled:opacity-50 bg-blue-900 text-white hover:bg-blue-600/90 h-10 px-4 py-2 w-full cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </CardFooter>
        </form>

      </Card>
    </div>
  );
}