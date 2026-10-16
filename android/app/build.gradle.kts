plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val teleUrl: String = providers.gradleProperty("teleUrl").get()

android {
    namespace = "cl.tele.tv"
    compileSdk = 35

    defaultConfig {
        applicationId = "cl.tele.tv"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
        buildConfigField("String", "TELE_URL", "\"$teleUrl\"")
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}
