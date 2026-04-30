import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SEED_CITIES = [
  { city: 'Chennai', state: 'Tamil Nadu' },
  { city: 'Coimbatore', state: 'Tamil Nadu' },
  { city: 'Madurai', state: 'Tamil Nadu' },
  { city: 'Salem', state: 'Tamil Nadu' },
  { city: 'Krishnagiri', state: 'Tamil Nadu' },
  { city: 'Bengaluru', state: 'Karnataka' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Kochi', state: 'Kerala' },
  { city: 'Thiruvananthapuram', state: 'Kerala' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Noida', state: 'Uttar Pradesh' },
  { city: 'Gurugram', state: 'Haryana' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Chandigarh', state: 'Punjab' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Ahmedabad', state: 'Gujarat' },
  { city: 'Surat', state: 'Gujarat' },
  { city: 'Nagpur', state: 'Maharashtra' },
  { city: 'Kolkata', state: 'West Bengal' },
  { city: 'Bhubaneswar', state: 'Odisha' },
  { city: 'Patna', state: 'Bihar' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.secret !== process.env.ADMIN_SEED_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let totalSaved = 0
    const errors: string[] = []
    const results: any[] = []

    for (const { city, state } of SEED_CITIES) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jsk-car-body-shop.vercel.app'
        const res = await fetch(`${baseUrl}/api/dealers/osm?city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&type=all`)
        const data = await res.json()

        if (data.dealers && data.dealers.length > 0) {
          const toInsert = data.dealers.map((d: any) => ({
            name: d.name,
            phone: d.phone,
            whatsapp_url: d.whatsapp_url,
            address: d.address,
            city: d.city,
            state: d.state,
            latitude: d.latitude,
            longitude: d.longitude,
            google_maps_url: d.google_maps_url,
            osm_maps_url: d.osm_maps_url,
            website: d.website,
            email: d.email,
            working_hours: d.working_hours,
            dealer_type: d.dealer_type,
            brand: d.brand,
            description: d.description,
            source: 'openstreetmap',
            osm_id: d.osm_id,
            is_active: true,
            is_verified: false,
            total_reviews: 0,
            average_rating: 0,
            years_experience: 0,
            ai_score: 0,
            specializations: [],
            images: [],
          }))

          const { error } = await supabase
            .from('dealers')
            .upsert(toInsert, { onConflict: 'osm_id', ignoreDuplicates: true })

          if (error) {
            errors.push(`${city}: ${error.message}`)
          } else {
            totalSaved += data.dealers.length
            results.push({ city, count: data.dealers.length })
          }
        } else {
          results.push({ city, count: 0 })
        }

        // Be polite to Overpass API
        await new Promise(r => setTimeout(r, 1500))

      } catch (e: any) {
        errors.push(`${city}: ${e.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      totalSaved,
      results,
      errors,
      message: `Seeded ${totalSaved} real dealers from OpenStreetMap across India!`
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
