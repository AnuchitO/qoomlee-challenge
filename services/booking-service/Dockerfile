FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o booking-service .

FROM alpine:3.19
WORKDIR /app
COPY --from=build /app/booking-service .
EXPOSE 8082
ENTRYPOINT ["./booking-service"]
