FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod ./
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o api-gateway .

FROM alpine:3.20
WORKDIR /app
COPY --from=build /app/api-gateway .
EXPOSE 8080
ENTRYPOINT ["./api-gateway"]
