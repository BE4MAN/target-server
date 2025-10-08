# Build Stage (Gradle 빌드)
FROM gradle:8.6-jdk17 AS builder
WORKDIR /app
ENV HOME=/tmp

# 1) 최소 파일만 복사하고 wrapper 생성
COPY build.gradle settings.gradle ./
RUN gradle --no-daemon wrapper

# 2) 전체 소스 복사
COPY . .
RUN chmod +x gradlew

# 3) 혹시 레포에서 덮어쓴 잘못된 wrapper가 있으면 제거 후 재생성 ▶️ 핵심!
RUN rm -f gradle/wrapper/gradle-wrapper.jar && gradle --no-daemon wrapper

# 4) 빌드
RUN ./gradlew --no-daemon clean build -x test

# 5) 산출물 통일
RUN ls -1 build/libs/*.jar && cp build/libs/*.jar app.jar

# Runtime Stage (실행 환경)
FROM openjdk:17-jdk-slim
WORKDIR /app

ENV TZ=Asia/Seoul
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata ca-certificates \
 && ln -fs /usr/share/zoneinfo/$TZ /etc/localtime \
 && dpkg-reconfigure -f noninteractive tzdata \
 && rm -rf /var/lib/apt/lists/*

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:InitialRAMPercentage=25 -XX:+UseG1GC -XX:+UseStringDeduplication -Duser.timezone=Asia/Seoul"

COPY --from=builder /app/app.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
