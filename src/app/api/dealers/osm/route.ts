import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city') || 'Chennai'
  const state = searchParams.get('state') || 'Tamil Nadu'
  const type = searchParams.get('type') || 'all'

  try {
    // Step 1: Get bounding box for the city using Nominatim (free)
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', ' + state + ', India')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'JSKCarBodyShop/1.0 (jskjageer@gmail.com)' } }
    )
    const geoData = await geoRes.json()

    if (!geoData[0]) {
      return NextResponse.json({ dealers: [], error: 'City not found' })
    }

    const { boundingbox } = geoData[0]
    const bbox = `${boundingbox[0]},${boundingbox[2]},${boundingbox[1]},${boundingbox[3]}`

    let shopTags = ''
    if (type === 'car_dealer') {
      shopTags = `
        node["shop"="car"](${bbox});
        way["shop"="car"](${bbox});
        node["shop"="car_dealer"](${bbox});
        node["amenity"="car_dealer"](${bbox});
      `
    } else if (type === 'spare_parts') {
      shopTags = `
        node["shop"="car_parts"](${bbox});
        way["shop"="car_parts"](${bbox});
        node["shop"="tyres"](${bbox});
        node["shop"="car_repair"](${bbox});
      `
    } else {
      shopTags = `
        node["shop"="car"](${bbox});
        way["shop"="car"](${bbox});
        node["shop"="car_parts"](${bbox});
        way["shop"="car_parts"](${bbox});
        node["shop"="car_repair"](${bbox});
        way["shop"="car_repair"](${bbox});
        node["shop"="tyres"](${bbox});
        node["shop"="car_dealer"](${bbox});
        node["amenity"="car_rental"](${bbox});
      `
    }

    const overpassQuery = `
      [out:json][timeout:30];
      (
        ${shopTags}
      );
      out body;
      >;
      out skel qt;
    `

    const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

    const overpassData = await overpassRes.json()

    const dealers = (overpassData.elements || [])
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => {
        const tags = el.tags

        let dealerType: string[] = ['car_dealer']
        if (tags.shop === 'car_parts' || tags.shop === 'tyres') dealerType = ['spare_parts']
        if (tags.shop === 'car_repair') dealerType = ['both']

        const lat = el.lat || el.center?.lat || null
        const lon = el.lon || el.center?.lon || null

        const mapsUrl = lat && lon
          ? `https://www.google.com/maps?q=${lat},${lon}`
          : `https://www.google.com/maps/search/${encodeURIComponent(tags.name + ' ' + city)}`

        const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null
        const cleanPhone = phone ? phone.replace(/[\s\-\+\(\)]/g, '').replace(/^0/, '91') : null

        return {
          id: `osm_${el.id}`,
          osm_id: el.id,
          name: tags.name,
          phone,
          whatsapp_url: cleanPhone ? `https://wa.me/${cleanPhone}` : null,
          address: [
            tags['addr:housenumber'],
            tags['addr:street'],
            tags['addr:suburb'],
            tags['addr:city'] || city,
            tags['addr:postcode']
          ].filter(Boolean).join(', ') || `${city}, ${state}`,
          city: tags['addr:city'] || city,
          state,
          latitude: lat,
          longitude: lon,
          google_maps_url: mapsUrl,
          osm_maps_url: lat ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=17` : null,
          website: tags.website || tags['contact:website'] || null,
          email: tags.email || tags['contact:email'] || null,
          working_hours: tags.opening_hours || null,
          dealer_type: dealerType,
          brand: tags.brand || null,
          description: tags.description || null,
          source: 'openstreetmap',
          is_verified: false,
        }
      })
      .filter((d: any) => d.latitude && d.longitude)

    return NextResponse.json({
      dealers,
      count: dealers.length,
      city,
      state,
      source: 'OpenStreetMap Overpass API'
    })

  } catch (error) {
    console.error('OSM dealer search error:', error)
    return NextResponse.json({ dealers: [], error: 'Search failed' })
  }
}
