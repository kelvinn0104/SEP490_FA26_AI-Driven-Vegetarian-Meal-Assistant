# ===== Stage 1: build =====
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj trước để cache bước restore
COPY VeggieAI.API/VeggieAI.API.csproj VeggieAI.API/
COPY VeggieAI.Model/VeggieAI.Model.csproj VeggieAI.Model/
COPY VeggieAI.Repository/VeggieAI.Repository.csproj VeggieAI.Repository/
COPY VeggieAI.Service/VeggieAI.Service.csproj VeggieAI.Service/
RUN dotnet restore VeggieAI.API/VeggieAI.API.csproj

# Copy toàn bộ source rồi publish
COPY VeggieAI.API/ VeggieAI.API/
COPY VeggieAI.Model/ VeggieAI.Model/
COPY VeggieAI.Repository/ VeggieAI.Repository/
COPY VeggieAI.Service/ VeggieAI.Service/
RUN dotnet publish VeggieAI.API/VeggieAI.API.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

# ===== Stage 2: runtime =====
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080 \
    ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

COPY --from=build /app/publish .

# Thư viện GSSAPI mà Npgsql cần (tránh cảnh báo libgssapi_krb5.so.2)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

# Thư mục lưu ảnh upload (LocalFileStorage) - cấp quyền cho user non-root
RUN mkdir -p /app/wwwroot/uploads && chown -R $APP_UID /app/wwwroot
USER $APP_UID

ENTRYPOINT ["dotnet", "VeggieAI.API.dll"]
