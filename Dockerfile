# Build Stage (Gradle 빌드)
FROM gradle:8.6-jdk17 AS builder
WORKDIR /app
ENV HOME=/tmp

# 1) 캐시 최적화: 최소 파일만 복사
COPY build.gradle settings.gradle ./

# 2) 이미지 내 gradle로 wrapper 생성
RUN gradle --no-daemon wrapper

# 소스 복사 후 빌드
COPY . .
RUN chmod +x gradlew
RUN ./gradlew --no-daemon clean build -x test

# 산출물만 명확히 고정
RUN ls -1 build/libs/*.jar && cp build/libs/*.jar app.jar

# Runtime Stage (실행 환경)
FROM openjdk:17-jdk-slim
WORKDIR /app

# 1) 타임존 설정 (컨테이너 시스템 타임존)
ENV TZ=Asia/Seoul
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata ca-certificates \
 && ln -fs /usr/share/zoneinfo/$TZ /etc/localtime \
 && dpkg-reconfigure -f noninteractive tzdata \
 && rm -rf /var/lib/apt/lists/*

# 2) JVM 기본 옵션 (컨테이너 메모리 친화 + GC)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 \
 -XX:InitialRAMPercentage=25 \
 -XX:+UseG1GC \
 -XX:+UseStringDeduplication \
 -Duser.timezone=Asia/Seoul"

# 애플리케이션 JAR 복사
COPY --from=builder /app/app.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
