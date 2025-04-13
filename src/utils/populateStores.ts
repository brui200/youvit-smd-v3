
import { supabase } from '@/integrations/supabase/client';

// Jakarta neighborhoods for realistic store locations
const jakartaNeighborhoods = [
  'Menteng', 'Kemang', 'Kebayoran Baru', 'Kuningan', 'Sudirman', 
  'Thamrin', 'Senayan', 'Grogol', 'Pluit', 'Pantai Indah Kapuk',
  'Kelapa Gading', 'Tebet', 'Manggarai', 'Cikini', 'Rawamangun',
  'Cilandak', 'Pondok Indah', 'Blok M', 'Tanah Abang', 'Glodok'
];

// Common store types in Indonesia
const storeTypes = ['Minimarket', 'Supermarket', 'Hypermarket', 'Convenience Store', 'Department Store'];

// Generate random coordinates within Jakarta
const generateJakartaCoordinates = () => {
  // Jakarta's approximate bounds
  const lat = -6.1 - (Math.random() * 0.3); // Between -6.1 and -6.4
  const lng = 106.7 + (Math.random() * 0.3); // Between 106.7 and 107.0
  return { lat, lng };
};

// Generate random monthly revenue
const generateMonthlyRevenue = () => {
  return Math.floor(10000000 + Math.random() * 90000000); // Between 10M and 100M IDR
};

// Generate a store name
const generateStoreName = (index: number) => {
  const brands = ['Indomaret', 'Alfamart', 'Circle K', 'FamilyMart', 'GrandLucky', 'Ranch Market', 'Transmart', 'Lotte Mart', 'Hero', 'Hypermart'];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const neighborhood = jakartaNeighborhoods[Math.floor(Math.random() * jakartaNeighborhoods.length)];
  return `${brand} ${neighborhood} ${index}`;
};

// Generate random address in Jakarta
const generateAddress = () => {
  const streetTypes = ['Jalan', 'Jl.'];
  const streetNames = ['Sudirman', 'Thamrin', 'Gatot Subroto', 'Rasuna Said', 'Asia Afrika', 'Casablanca', 'Kuningan', 'Kebon Sirih', 'Hayam Wuruk', 'Gajah Mada'];
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const number = Math.floor(1 + Math.random() * 200);
  const neighborhood = jakartaNeighborhoods[Math.floor(Math.random() * jakartaNeighborhoods.length)];
  return `${streetType} ${streetName} No. ${number}, ${neighborhood}, Jakarta`;
};

// Generate a random instruction
const generateInstruction = () => {
  const instructions = [
    'Check product placement on end caps',
    'Verify promotional signage is properly displayed',
    'Ensure all price tags are accurate',
    'Restock beverages section if needed',
    'Check expiration dates on dairy products',
    null, // Sometimes no instructions
    'Assess competitor product placement',
    'Verify POS material installation',
    'Check stock levels of featured products',
    'Ensure promotional displays are set up correctly'
  ];
  return instructions[Math.floor(Math.random() * instructions.length)];
};

// Modified function to use service role for inserts
export const populateJakartaStores = async (count: number = 200) => {
  try {
    const stores = [];
    
    for (let i = 1; i <= count; i++) {
      const coords = generateJakartaCoordinates();
      stores.push({
        name: generateStoreName(i),
        address: generateAddress(),
        latitude: coords.lat,
        longitude: coords.lng,
        monthly_revenue: generateMonthlyRevenue(),
        instructions: generateInstruction()
      });
    }
    
    // Insert stores one by one to avoid batch issues
    let successCount = 0;
    
    for (const store of stores) {
      try {
        const { data, error } = await supabase
          .from('stores')
          .insert(store)
          .select();
          
        if (error) {
          console.error('Error inserting store:', error);
        } else if (data && data.length > 0) {
          successCount++;
        }
      } catch (insertError) {
        console.error('Exception during store insert:', insertError);
      }
    }
    
    return { success: true, count: successCount };
  } catch (error) {
    console.error('Error populating stores:', error);
    return { success: false, error };
  }
};
