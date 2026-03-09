import { NextResponse } from 'next/server';

// Google Maps API - supports geocoding, places, and directions
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, apiKey, ...params } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (geocode, reverseGeocode, places, directions, distance)' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'geocode':
        // Convert address to coordinates
        if (!params.address) {
          return NextResponse.json(
            { error: 'Address is required for geocoding' },
            { status: 400 }
          );
        }
        
        const geoResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(params.address)}&key=${apiKey}`
        );
        const geoData = await geoResponse.json();

        if (geoData.status !== 'OK') {
          return NextResponse.json(
            { error: geoData.status || 'Geocoding failed' },
            { status: 400 }
          );
        }

        result = {
          status: 'OK',
          address: geoData.results[0].formatted_address,
          location: geoData.results[0].geometry.location,
          placeId: geoData.results[0].place_id,
        };
        break;

      case 'reverseGeocode':
        // Convert coordinates to address
        if (!params.lat || !params.lng) {
          return NextResponse.json(
            { error: 'Latitude and longitude are required' },
            { status: 400 }
          );
        }

        const reverseResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${params.lat},${params.lng}&key=${apiKey}`
        );
        const reverseData = await reverseResponse.json();

        if (reverseData.status !== 'OK') {
          return NextResponse.json(
            { error: reverseData.status || 'Reverse geocoding failed' },
            { status: 400 }
          );
        }

        result = {
          status: 'OK',
          address: reverseData.results[0].formatted_address,
          placeId: reverseData.results[0].place_id,
        };
        break;

      case 'places':
        // Search for places
        if (!params.query) {
          return NextResponse.json(
            { error: 'Query is required for places search' },
            { status: 400 }
          );
        }

        const placesResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(params.query)}&key=${apiKey}`
        );
        const placesData = await placesResponse.json();

        if (placesData.status !== 'OK') {
          return NextResponse.json(
            { error: placesData.status || 'Places search failed' },
            { status: 400 }
          );
        }

        result = {
          status: 'OK',
          count: placesData.results.length,
          places: placesData.results.slice(0, 10).map((place: any) => ({
            name: place.name,
            address: place.formatted_address,
            location: place.geometry.location,
            placeId: place.place_id,
            rating: place.rating,
            types: place.types,
          })),
        };
        break;

      case 'directions':
        // Get directions between two points
        if (!params.origin || !params.destination) {
          return NextResponse.json(
            { error: 'Origin and destination are required' },
            { status: 400 }
          );
        }

        const directionsUrl = new URL('https://maps.googleapis.com/maps/api/directions/json');
        directionsUrl.searchParams.append('origin', params.origin);
        directionsUrl.searchParams.append('destination', params.destination);
        if (params.mode) directionsUrl.searchParams.append('mode', params.mode);
        if (params.waypoints) directionsUrl.searchParams.append('waypoints', params.waypoints);
        directionsUrl.searchParams.append('key', apiKey);

        const directionsResponse = await fetch(directionsUrl.toString());
        const directionsData = await directionsResponse.json();

        if (directionsData.status !== 'OK') {
          return NextResponse.json(
            { error: directionsData.status || 'Directions failed' },
            { status: 400 }
          );
        }

        const route = directionsData.routes[0];
        result = {
          status: 'OK',
          summary: route.summary,
          distance: route.legs[0].distance.text,
          duration: route.legs[0].duration.text,
          startAddress: route.legs[0].start_address,
          endAddress: route.legs[0].end_address,
          encodedPolyline: route.overview_polyline.points,
          steps: route.legs[0].steps.map((step: any) => ({
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            distance: step.distance.text,
            duration: step.duration.text,
            startLocation: step.start_location,
            endLocation: step.end_location,
          })),
        };
        break;

      case 'distance':
        // Calculate distance between two points
        if (!params.origin || !params.destination) {
          return NextResponse.json(
            { error: 'Origin and destination are required' },
            { status: 400 }
          );
        }

        const distanceUrl = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        distanceUrl.searchParams.append('origins', params.origin);
        distanceUrl.searchParams.append('destinations', params.destination);
        if (params.mode) distanceUrl.searchParams.append('mode', params.mode);
        distanceUrl.searchParams.append('key', apiKey);

        const distanceResponse = await fetch(distanceUrl.toString());
        const distanceData = await distanceResponse.json();

        if (distanceData.status !== 'OK') {
          return NextResponse.json(
            { error: distanceData.status || 'Distance calculation failed' },
            { status: 400 }
          );
        }

        result = {
          status: 'OK',
          origin: params.origin,
          destination: params.destination,
          distance: distanceData.rows[0].elements[0].distance.text,
          duration: distanceData.rows[0].elements[0].duration.text,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Maps API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

