import { supabase } from '@/integrations/supabase/client';

// Test the email function directly
const testEmailFunction = async () => {
  console.log('Testing email function...');
  
  try {
    const result = await supabase.functions.invoke('send-order-confirmation', {
      body: { orderId: '1512b782-4273-4c85-9c31-9df5dd0838ae' }
    });
    
    console.log('Email function result:', result);
  } catch (error) {
    console.error('Email function error:', error);
  }
};

// Call immediately
testEmailFunction();