import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || "Tamil Nadu";
  const city = searchParams.get("city") || "";
  const area = city || state;

  const query = `
    [out:json][timeout:30];
    area["name"="${area}"]["boundary"="administrative"]->.searchArea;
    (
      node["shop"="car"]["name"](area.searchArea);
      node["shop"="car_parts"]["name"](area.searchArea);
      node["shop"="car_repair"]["name"](area.searchArea);
      node["amenity"="car_rental"]["name"](area.searchArea);
      way["shop"="car"]["name"](area.searchArea);
      way["shop"="car_repair"]["name"](area.searchArea);
      way["shop"="car_parts"]["name"](area.searchArea);
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" },
    });
    const data = await response.json();
    const dealers = data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id.toString(),
        name: el.tags.name,
        phone: el.tags.phone || el.tags["contact:phone"] || null,
        email: el.tags.email || el.tags["contact:email"] || null,
        website: el.tags.website || el.tags["contact:website"] || null,
        address: [el.tags["addr:street"], el.tags["addr:city"]].filter(Boolean).join(", ") || null,
        city: el.tags["addr:city"] || city || state,
        state: el.tags["addr:state"] || state,
        type: el.tags.shop || el.tags.amenity || "car_dealer",
        lat: el.lat || null,
        lon: el.lon || null,
        source: "openstreetmap"
      }));
    return NextResponse.json({ dealers, total: dealers.length });
  } catch (error) {
    return NextResponse.json({ dealers: [], total: 0, error: "Failed to fetch" });
  }
}
