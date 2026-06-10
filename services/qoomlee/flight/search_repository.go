package flight

import "context"

func (r *repository) Search(ctx context.Context, params SearchParams) ([]Flight, error) {
	q := selectFlightCols + `
	FROM flights f
	JOIN routes r ON r.id = f.route_id
	WHERE r.origin_iata      = $1
	  AND r.destination_iata = $2
	  AND f.departure_time  >= $3
	  AND f.departure_time   < $4
	  AND f.available_seats >= $5
	  AND f.status           = 'SCHEDULED'
	ORDER BY f.departure_time`

	rows, err := r.db.QueryContext(ctx, q,
		params.Origin, params.Destination,
		params.DateFrom, params.DateTo,
		params.Passengers,
	)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	var flights []Flight
	for rows.Next() {
		var f Flight
		if err := scanFlight(rows, &f); err != nil {
			return nil, err
		}
		flights = append(flights, f)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return flights, nil
}
