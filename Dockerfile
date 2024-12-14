# Use the .NET 8.0 SDK image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

# Copy the project files
COPY *.csproj ./
RUN dotnet restore

# Copy the rest of the files
COPY . ./

# Build and publish the app
RUN dotnet publish -c Release -o out

# Use the .NET 8.0 runtime for the final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 5145  
ENTRYPOINT ["dotnet", "NotificationApi.dll"]
