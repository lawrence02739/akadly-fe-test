export const STATIC_STUDENTS: { id: string; name: string }[] = [
  { id: 'S1001', name: 'Aarav Patel' },
  { id: 'S1002', name: 'Priya Sharma' },
  { id: 'S1003', name: 'Rohan Gupta' },
  { id: 'S1004', name: 'Neha Singh' },
  { id: 'S1005', name: 'Ananya Desai' },
  { id: 'S1006', name: 'Aditya Kumar' },
  { id: 'S1007', name: 'Kavya Reddy' },
  { id: 'S1008', name: 'Rahul Verma' },
  { id: 'S1009', name: 'Sanya Joshi' },
  { id: 'S1010', name: 'Vikram Mehta' },
];

export const STATIC_COURIER_PARTNERS: { id: string; name: string }[] = [
  { id: 'C001', name: 'BlueDart Express' },
  { id: 'C002', name: 'FedEx India' },
  { id: 'C003', name: 'DHL Express' },
  { id: 'C004', name: 'India Post' },
];

// Note: Only id+name are available here, so the order-creation form cannot 
// auto-fill a student's address or a courier's rate/ETA the way the Figma 
// "New Shipment" screen shows — those fields become plain manual text inputs 
// for now, not derived lookups.
