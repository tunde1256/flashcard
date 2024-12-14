# Use the .NET 8.0 SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the project files to the container and restore the dependencies
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the files to the container
COPY . ./

# Build and publish the app in Release mode
RUN dotnet publish -c Release -o /app/out

# Use the .NET 8.0 runtime image for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Set the working directory inside the container
WORKDIR /app

# Expose port 8080 (or whatever port your app listens to)
EXPOSE 8080

# Copy the build output from the build stage
COPY --from=build /app/out .

# Define the entry point to run the application
ENTRYPOINT ["dotnet", "NotificationApi.dll"]
