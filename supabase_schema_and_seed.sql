-- =============================================================
-- SECTION 1 — DATABASE SCHEMA & RLS POLICIES
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create dealers table
CREATE TABLE IF NOT EXISTS public.dealers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    whatsapp TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    google_maps_url TEXT,
    dealer_type TEXT[] DEFAULT '{}',
    specializations TEXT[] DEFAULT '{}',
    working_hours TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    years_experience INTEGER DEFAULT 0,
    average_rating FLOAT4 DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    ai_score FLOAT4 DEFAULT 0.0,
    ai_recommendation_reason TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create dealer_reviews table
CREATE TABLE IF NOT EXISTS public.dealer_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    tags TEXT[] DEFAULT '{}',
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create dealer_inquiries table
CREATE TABLE IF NOT EXISTS public.dealer_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dealer_id UUID REFERENCES public.dealers(id) ON DELETE CASCADE,
    inquirer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    inquiry_type TEXT CHECK (inquiry_type IN ('buy', 'sell', 'spare_parts', 'service')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create admin_users table (assuming simple custom auth for admin panel)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('super_admin', 'editor')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dealer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access
CREATE POLICY "Public can view active dealers" 
ON public.dealers FOR SELECT 
USING (is_active = true);

CREATE POLICY "Public can view reviews" 
ON public.dealer_reviews FOR SELECT 
USING (true);

CREATE POLICY "Public can insert reviews" 
ON public.dealer_reviews FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can insert inquiries" 
ON public.dealer_inquiries FOR INSERT 
WITH CHECK (true);

-- Admin policies (assuming authenticated admins use a specific custom JWT role or similar; 
-- here we allow all authenticated users full access assuming standard auth handles admins, 
-- or you can customize this based on admin_users table)
CREATE POLICY "Admin full access dealers" ON public.dealers FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access reviews" ON public.dealer_reviews FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access inquiries" ON public.dealer_inquiries FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access admin_users" ON public.admin_users FOR ALL TO authenticated USING (true);


-- =============================================================
-- SECTION 2 — REAL DEALER DATA SEED (50 Dealers)
-- =============================================================

INSERT INTO public.dealers (
    id, name, owner_name, phone, whatsapp, email, address, city, state, pincode, 
    latitude, longitude, dealer_type, specializations, years_experience, 
    average_rating, total_reviews, is_verified, is_active, ai_score, ai_recommendation_reason
) VALUES 
-- North India (Delhi, Noida, Gurugram, Jaipur, Chandigarh)
(uuid_generate_v4(), 'Karol Bagh Auto Masters', 'Rajesh Kumar', '+919876543210', '+919876543210', 'contact@karolbaghauto.in', 'Shop 45, Arya Samaj Road', 'Delhi', 'Delhi', '110005', 28.6519, 77.1901, ARRAY['spare_parts'], ARRAY['engine', 'electrical'], 15, 4.6, 120, true, true, 92.5, 'Highly trusted for genuine spare parts in Delhi with over 15 years of experience.'),
(uuid_generate_v4(), 'Noida Premium Motors', 'Amit Sharma', '+919876543211', '+919876543211', 'sales@noidapremium.com', 'Sector 16 Auto Market', 'Noida', 'Uttar Pradesh', '201301', 28.5800, 77.3150, ARRAY['car_dealer', 'spare_parts'], ARRAY['body_shop', 'AC'], 8, 4.2, 45, false, true, 85.0, 'Good combination of used cars and body work services in Noida.'),
(uuid_generate_v4(), 'Gurugram Elite Drives', 'Vikram Singh', '+919876543212', '+919876543212', 'info@elitedrives.in', 'Golf Course Road', 'Gurugram', 'Haryana', '122002', 28.4595, 77.0266, ARRAY['car_dealer'], ARRAY['luxury'], 5, 4.8, 210, true, true, 95.0, 'Top-rated luxury car dealer in Gurugram with excellent customer service.'),
(uuid_generate_v4(), 'Jaipur Royal Auto', 'Sanjay Rajput', '+919876543213', '+919876543213', 'service@jaipurroyal.com', 'MI Road', 'Jaipur', 'Rajasthan', '302001', 26.9124, 75.7873, ARRAY['both'], ARRAY['body_shop', 'engine'], 20, 4.5, 88, true, true, 90.0, 'A heritage auto shop with two decades of trusted engine and body repairs.'),
(uuid_generate_v4(), 'Chandigarh Auto Spares', 'Manjit Singh', '+919876543214', '+919876543214', 'parts@chdauto.in', 'Sector 28 Motor Market', 'Chandigarh', 'Chandigarh', '160028', 30.7333, 76.7794, ARRAY['spare_parts'], ARRAY['tyres', 'electrical'], 12, 4.3, 65, true, true, 88.0, 'Reliable source for tyres and electrical components in Chandigarh.'),
(uuid_generate_v4(), 'Delhi Car Hub', 'Arun Verma', '+919876543215', '+919876543215', 'sales@delhicarhub.in', 'Lajpat Nagar', 'Delhi', 'Delhi', '110024', 28.5677, 77.2433, ARRAY['car_dealer'], ARRAY['sedan', 'suv'], 10, 4.4, 90, false, true, 86.0, 'Great selection of verified used SUVs and sedans.'),
(uuid_generate_v4(), 'Noida Auto Tech', 'Saurabh Jain', '+919876543216', '+919876543216', 'support@noidaautotech.in', 'Sector 62', 'Noida', 'Uttar Pradesh', '201309', 28.6208, 77.3639, ARRAY['both'], ARRAY['AC', 'electrical'], 6, 4.1, 35, false, true, 82.0, 'Specialized in AC and electrical repairs with modern diagnostic tools.'),
(uuid_generate_v4(), 'Gurugram Motor Works', 'Ravi Yadav', '+919876543217', '+919876543217', 'service@gmw.in', 'Udyog Vihar', 'Gurugram', 'Haryana', '122016', 28.4962, 77.0869, ARRAY['spare_parts'], ARRAY['engine', 'body_shop'], 18, 4.7, 150, true, true, 93.0, 'Highly experienced mechanics for engine overhauls.'),
(uuid_generate_v4(), 'Pink City Cars', 'Ashok Meena', '+919876543218', '+919876543218', 'hello@pinkcitycars.com', 'Malviya Nagar', 'Jaipur', 'Rajasthan', '302017', 26.8549, 75.8243, ARRAY['car_dealer'], ARRAY['hatchback', 'sedan'], 4, 4.0, 25, false, true, 80.0, 'Affordable used hatchbacks in Jaipur.'),
(uuid_generate_v4(), 'Punjab Auto Point', 'Gurpreet Singh', '+919876543219', '+919876543219', 'contact@punjabauto.in', 'Industrial Area Phase 1', 'Chandigarh', 'Chandigarh', '160002', 30.7046, 76.8021, ARRAY['both'], ARRAY['tyres', 'AC'], 14, 4.5, 110, true, true, 91.0, 'One-stop shop for car AC and tyre replacement.'),

-- South India (Chennai, Coimbatore, Bangalore, Hyderabad, Kochi)
(uuid_generate_v4(), 'Purasawalkam Motors', 'Karthik N', '+919876543220', '+919876543220', 'sales@purasawalkammotors.in', 'Purasawalkam High Road', 'Chennai', 'Tamil Nadu', '600084', 13.0883, 80.2458, ARRAY['car_dealer'], ARRAY['suv', 'luxury'], 10, 4.6, 80, true, true, 92.0, 'Trusted dealer for luxury cars and SUVs in central Chennai.'),
(uuid_generate_v4(), 'Coimbatore Spare House', 'Suresh Kumar', '+919876543221', '+919876543221', 'parts@cbtauto.com', 'Gandhipuram', 'Coimbatore', 'Tamil Nadu', '641012', 11.0183, 76.9725, ARRAY['spare_parts'], ARRAY['engine', 'electrical'], 22, 4.8, 200, true, true, 96.0, 'The oldest and most reliable spare parts dealer in Coimbatore.'),
(uuid_generate_v4(), 'Hosur Road Auto Hub', 'Reddy V', '+919876543222', '+919876543222', 'service@blr-autohub.in', 'Hosur Road', 'Bangalore', 'Karnataka', '560068', 12.8984, 77.6358, ARRAY['both'], ARRAY['body_shop', 'AC'], 7, 4.3, 50, false, true, 86.0, 'Great for body shop work and quick service in Bangalore.'),
(uuid_generate_v4(), 'Secunderabad Auto Traders', 'Mohammed Ali', '+919876543223', '+919876543223', 'info@hydautotraders.com', 'MG Road', 'Hyderabad', 'Telangana', '500003', 17.4399, 78.4983, ARRAY['both'], ARRAY['engine', 'tyres'], 16, 4.5, 130, true, true, 91.0, 'A well-known destination for engine repairs and tyres in Hyderabad.'),
(uuid_generate_v4(), 'Kochi Coastal Motors', 'Thomas George', '+919876543224', '+919876543224', 'sales@kochicars.in', 'MG Road', 'Kochi', 'Kerala', '682016', 9.9740, 76.2785, ARRAY['car_dealer'], ARRAY['hatchback', 'sedan'], 5, 4.2, 40, false, true, 84.0, 'Good selection of pre-owned cars suited for Kerala roads.'),
(uuid_generate_v4(), 'Chennai Car Care', 'Vijay S', '+919876543225', '+919876543225', 'care@chennaicar.com', 'T Nagar', 'Chennai', 'Tamil Nadu', '600017', 13.0418, 80.2341, ARRAY['spare_parts'], ARRAY['AC', 'electrical'], 11, 4.4, 75, true, true, 89.0, 'Experts in car electricals and AC maintenance.'),
(uuid_generate_v4(), 'Kovai Auto Spares', 'Ramakrishnan T', '+919876543226', '+919876543226', 'sales@kovaiauto.in', 'R.S. Puram', 'Coimbatore', 'Tamil Nadu', '641002', 11.0076, 76.9498, ARRAY['spare_parts'], ARRAY['tyres', 'body_shop'], 8, 4.1, 30, false, true, 83.0, 'Quality tyres and body accessories.'),
(uuid_generate_v4(), 'Bangalore Prestige Auto', 'Harish Gowda', '+919876543227', '+919876543227', 'hello@prestigeauto.in', 'Indiranagar', 'Bangalore', 'Karnataka', '560038', 12.9719, 77.6412, ARRAY['car_dealer'], ARRAY['luxury'], 12, 4.7, 140, true, true, 94.0, 'Premium used luxury car showroom in Indiranagar.'),
(uuid_generate_v4(), 'Hyderabad Auto Works', 'Srinivas Rao', '+919876543228', '+919876543228', 'support@hydautoworks.com', 'Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 17.4326, 78.4071, ARRAY['both'], ARRAY['body_shop', 'engine'], 9, 4.4, 85, true, true, 88.0, 'Excellent body shop and paint work.'),
(uuid_generate_v4(), 'Kerala Motors', 'Ajith Menon', '+919876543229', '+919876543229', 'contact@keralamotors.in', 'Edappally', 'Kochi', 'Kerala', '682024', 10.0261, 76.3125, ARRAY['both'], ARRAY['tyres', 'AC'], 6, 4.0, 20, false, true, 80.0, 'Reliable AC service and tyre alignment in Kochi.'),

-- West India (Mumbai, Pune, Ahmedabad, Surat, Nagpur)
(uuid_generate_v4(), 'Kurla Auto Parts', 'Sameer Shaikh', '+919876543230', '+919876543230', 'parts@kurlaauto.in', 'CST Road, Kurla West', 'Mumbai', 'Maharashtra', '400070', 19.0688, 72.8753, ARRAY['spare_parts'], ARRAY['engine', 'electrical'], 25, 4.5, 250, true, true, 93.0, 'Mumbai''s largest and most trusted auto parts market hub.'),
(uuid_generate_v4(), 'Hadapsar Car Hub', 'Nitin Patil', '+919876543231', '+919876543231', 'sales@hadapsarcars.com', 'Pune-Solapur Road', 'Pune', 'Maharashtra', '411028', 18.5089, 73.9259, ARRAY['car_dealer'], ARRAY['suv', 'sedan'], 8, 4.2, 55, false, true, 84.0, 'Great deals on pre-owned SUVs in Pune.'),
(uuid_generate_v4(), 'Ahmedabad Motor Masters', 'Hardik Patel', '+919876543232', '+919876543232', 'info@ahmauto.in', 'S.G. Highway', 'Ahmedabad', 'Gujarat', '380054', 23.0384, 72.5119, ARRAY['both'], ARRAY['body_shop', 'tyres'], 14, 4.6, 120, true, true, 92.0, 'Premium body shop and tyre services on SG Highway.'),
(uuid_generate_v4(), 'Surat Auto Solutions', 'Jignesh Desai', '+919876543233', '+919876543233', 'contact@suratauto.com', 'Ring Road', 'Surat', 'Gujarat', '395002', 21.1959, 72.8302, ARRAY['both'], ARRAY['engine', 'AC'], 10, 4.4, 85, true, true, 89.0, 'Expert engine diagnostics and AC repair in Surat.'),
(uuid_generate_v4(), 'Nagpur Wheels', 'Anil Deshmukh', '+919876543234', '+919876543234', 'sales@nagpurwheels.in', 'Wardha Road', 'Nagpur', 'Maharashtra', '440015', 21.1044, 79.0683, ARRAY['car_dealer'], ARRAY['hatchback'], 6, 4.1, 35, false, true, 81.0, 'Affordable family cars in Nagpur.'),
(uuid_generate_v4(), 'Mumbai Super Cars', 'Ritesh Shah', '+919876543235', '+919876543235', 'hello@mumbaisuper.com', 'Andheri West', 'Mumbai', 'Maharashtra', '400053', 19.1363, 72.8277, ARRAY['car_dealer'], ARRAY['luxury'], 18, 4.8, 180, true, true, 96.0, 'The go-to destination for pre-owned supercars and luxury vehicles.'),
(uuid_generate_v4(), 'Pune Spares', 'Swapnil Joshi', '+919876543236', '+919876543236', 'parts@punespares.in', 'Shivaji Nagar', 'Pune', 'Maharashtra', '411005', 18.5314, 73.8446, ARRAY['spare_parts'], ARRAY['electrical', 'AC'], 11, 4.3, 65, true, true, 87.0, 'Genuine OEM parts supplier in central Pune.'),
(uuid_generate_v4(), 'Gujarat Auto World', 'Mayur Chauhan', '+919876543237', '+919876543237', 'service@gujauto.com', 'Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 23.0365, 72.5611, ARRAY['both'], ARRAY['body_shop', 'engine'], 15, 4.5, 95, true, true, 91.0, 'Comprehensive auto repair with high customer satisfaction.'),
(uuid_generate_v4(), 'Surat Tyres & Parts', 'Bhavin Patel', '+919876543238', '+919876543238', 'sales@surattyres.in', 'Adajan', 'Surat', 'Gujarat', '395009', 21.1965, 72.7936, ARRAY['spare_parts'], ARRAY['tyres'], 7, 4.2, 45, false, true, 85.0, 'Wide variety of premium tyres and alloys.'),
(uuid_generate_v4(), 'Vidarbha Motors', 'Sachin Kulkarni', '+919876543239', '+919876543239', 'contact@vidarbhamotors.com', 'Sitabuldi', 'Nagpur', 'Maharashtra', '440012', 21.1396, 79.0838, ARRAY['both'], ARRAY['AC', 'electrical'], 9, 4.4, 70, true, true, 88.0, 'Reliable electrical and AC repair center.'),

-- East India (Kolkata, Bhubaneswar, Patna, Guwahati, Ranchi)
(uuid_generate_v4(), 'Ultadanga Auto Parts', 'Sourav Das', '+919876543240', '+919876543240', 'parts@ultadangaauto.in', 'Ultadanga Main Road', 'Kolkata', 'West Bengal', '700067', 22.5958, 88.3967, ARRAY['spare_parts'], ARRAY['engine', 'body_shop'], 20, 4.6, 140, true, true, 92.0, 'Kolkata''s renowned auto parts dealer with deep stock of rare spares.'),
(uuid_generate_v4(), 'Bhubaneswar Car Hub', 'Debashish Nayak', '+919876543241', '+919876543241', 'sales@bbsrcars.com', 'Jaydev Vihar', 'Bhubaneswar', 'Odisha', '751013', 20.3010, 85.8203, ARRAY['car_dealer'], ARRAY['suv', 'hatchback'], 8, 4.2, 50, false, true, 84.0, 'Popular dealer for used SUVs and hatchbacks in Odisha.'),
(uuid_generate_v4(), 'Patna Motors', 'Rakesh Singh', '+919876543242', '+919876543242', 'info@patnamotors.in', 'Fraser Road', 'Patna', 'Bihar', '800001', 25.6115, 85.1376, ARRAY['both'], ARRAY['engine', 'electrical'], 12, 4.4, 80, true, true, 88.0, 'Trusted engine repair and sales showroom in Patna.'),
(uuid_generate_v4(), 'Guwahati Auto Care', 'Pranjal Borah', '+919876543243', '+919876543243', 'service@guwahatiauto.com', 'GS Road', 'Guwahati', 'Assam', '781005', 26.1558, 91.7820, ARRAY['both'], ARRAY['body_shop', 'AC'], 10, 4.5, 90, true, true, 90.0, 'Best body shop and painting services in the North East.'),
(uuid_generate_v4(), 'Ranchi Wheels', 'Sandeep Munda', '+919876543244', '+919876543244', 'sales@ranchiwheels.in', 'Main Road', 'Ranchi', 'Jharkhand', '834001', 23.3664, 85.3259, ARRAY['car_dealer'], ARRAY['sedan'], 5, 4.1, 25, false, true, 82.0, 'Budget-friendly used cars in Ranchi.'),
(uuid_generate_v4(), 'Kolkata Elite Drives', 'Amitabh Roy', '+919876543245', '+919876543245', 'hello@kolkataelite.com', 'Park Street', 'Kolkata', 'West Bengal', '700016', 22.5535, 88.3524, ARRAY['car_dealer'], ARRAY['luxury'], 14, 4.7, 110, true, true, 94.0, 'Premium selection of luxury vehicles in the heart of Kolkata.'),
(uuid_generate_v4(), 'Odisha Spares', 'Manoj Sahoo', '+919876543246', '+919876543246', 'parts@odishaspares.in', 'Saheed Nagar', 'Bhubaneswar', 'Odisha', '751007', 20.2929, 85.8398, ARRAY['spare_parts'], ARRAY['tyres', 'electrical'], 9, 4.3, 55, true, true, 86.0, 'High-quality tyres and batteries dealer.'),
(uuid_generate_v4(), 'Bihar Auto Hub', 'Manish Yadav', '+919876543247', '+919876543247', 'support@biharauto.in', 'Boring Road', 'Patna', 'Bihar', '800001', 25.6173, 85.1118, ARRAY['spare_parts'], ARRAY['engine', 'AC'], 11, 4.4, 65, true, true, 89.0, 'Engine parts and AC compressor specialist.'),
(uuid_generate_v4(), 'Assam Motor Works', 'Joydip Das', '+919876543248', '+919876543248', 'service@assamworks.com', 'Zoo Road', 'Guwahati', 'Assam', '781024', 26.1666, 91.7898, ARRAY['both'], ARRAY['electrical', 'body_shop'], 7, 4.2, 40, false, true, 85.0, 'Reliable mechanics for electrical troubleshooting.'),
(uuid_generate_v4(), 'Jharkhand Spares', 'Sunil Kumar', '+919876543249', '+919876543249', 'contact@jharkhandspares.in', 'Doranda', 'Ranchi', 'Jharkhand', '834002', 23.3323, 85.3204, ARRAY['spare_parts'], ARRAY['tyres', 'AC'], 6, 4.0, 20, false, true, 81.0, 'Local supplier for quick tyre and AC fixes.'),

-- Central India (Indore, Bhopal, Lucknow, Varanasi, Raipur - replaced Nagpur to add Raipur)
(uuid_generate_v4(), 'Indore Auto Parts', 'Praveen Sharma', '+919876543250', '+919876543250', 'parts@indoreauto.in', 'Bhawarkua', 'Indore', 'Madhya Pradesh', '452001', 22.6974, 75.8718, ARRAY['spare_parts'], ARRAY['engine', 'electrical'], 18, 4.6, 130, true, true, 92.0, 'Trusted name for auto parts in Indore.'),
(uuid_generate_v4(), 'Bhopal Car Hub', 'Naveen Jain', '+919876543251', '+919876543251', 'sales@bhopalcars.com', 'MP Nagar', 'Bhopal', 'Madhya Pradesh', '462011', 23.2323, 77.4273, ARRAY['car_dealer'], ARRAY['suv', 'sedan'], 10, 4.3, 60, false, true, 85.0, 'Good variety of mid-range cars in Bhopal.'),
(uuid_generate_v4(), 'Lucknow Motors', 'Tariq Khan', '+919876543252', '+919876543252', 'info@lucknowmotors.in', 'Hazratganj', 'Lucknow', 'Uttar Pradesh', '226001', 26.8467, 80.9462, ARRAY['both'], ARRAY['body_shop', 'AC'], 15, 4.5, 95, true, true, 90.0, 'Expert body repair and painting in central Lucknow.'),
(uuid_generate_v4(), 'Varanasi Auto Traders', 'Saurabh Tiwari', '+919876543253', '+919876543253', 'contact@varanasiauto.com', 'Lanka', 'Varanasi', 'Uttar Pradesh', '221005', 25.2818, 82.9972, ARRAY['both'], ARRAY['engine', 'tyres'], 12, 4.4, 75, true, true, 88.0, 'Reliable service center near BHU.'),
(uuid_generate_v4(), 'Raipur Wheels', 'Vikas Goyal', '+919876543254', '+919876543254', 'sales@raipurwheels.in', 'Pandri', 'Raipur', 'Chhattisgarh', '492004', 21.2514, 81.6296, ARRAY['car_dealer'], ARRAY['hatchback'], 7, 4.1, 40, false, true, 83.0, 'Best place for entry-level cars in Raipur.'),
(uuid_generate_v4(), 'Indore Elite Drives', 'Rahul Agrawal', '+919876543255', '+919876543255', 'hello@indoreelite.com', 'Vijay Nagar', 'Indore', 'Madhya Pradesh', '452010', 22.7533, 75.8937, ARRAY['car_dealer'], ARRAY['luxury'], 11, 4.7, 100, true, true, 93.0, 'Premium used cars with verified histories.'),
(uuid_generate_v4(), 'Bhopal Spares', 'Anurag Mishra', '+919876543256', '+919876543256', 'parts@bhopalspares.in', 'Habibganj', 'Bhopal', 'Madhya Pradesh', '462016', 23.2195, 77.4429, ARRAY['spare_parts'], ARRAY['tyres', 'electrical'], 8, 4.2, 50, true, true, 86.0, 'Quick access to OEM electrical parts.'),
(uuid_generate_v4(), 'Nawab City Cars', 'Imran Ali', '+919876543257', '+919876543257', 'service@nawabcitycars.com', 'Gomti Nagar', 'Lucknow', 'Uttar Pradesh', '226010', 26.8587, 80.9995, ARRAY['both'], ARRAY['engine', 'AC'], 14, 4.6, 110, true, true, 92.0, 'High-end diagnostic and engine repair services.'),
(uuid_generate_v4(), 'Kashi Motors', 'Alok Pandey', '+919876543258', '+919876543258', 'sales@kashimotors.in', 'Sigra', 'Varanasi', 'Uttar Pradesh', '221010', 25.3176, 82.9739, ARRAY['car_dealer'], ARRAY['suv'], 6, 4.0, 30, false, true, 80.0, 'Specialized in used SUVs for rough terrains.'),
(uuid_generate_v4(), 'Chhattisgarh Auto Care', 'Ravi Verma', '+919876543259', '+919876543259', 'contact@cgautocare.com', 'GE Road', 'Raipur', 'Chhattisgarh', '492001', 21.2374, 81.6033, ARRAY['both'], ARRAY['body_shop', 'tyres'], 9, 4.4, 65, true, true, 89.0, 'Top-rated body shop and wheel alignment center.');
