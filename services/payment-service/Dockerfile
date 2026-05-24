FROM golang:1.22-alpine AS build
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o payment-service .

FROM alpine:3.20
WORKDIR /app
COPY --from=build /app/payment-service .
EXPOSE 8084
ENTRYPOINT ["./payment-service"]
