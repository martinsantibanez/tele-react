import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val teleUrl: String = providers.gradleProperty("teleUrl").get()
val teleReleaseUrl: String = providers.gradleProperty("teleReleaseUrl").get()

// Release signing comes from keystore.properties (not checked in); without it
// the release build is left unsigned.
val keystoreProps = Properties().apply {
    rootProject.file("keystore.properties").takeIf { it.exists() }?.inputStream()?.use(::load)
}

android {
    namespace = "cl.tele.tv"
    compileSdk = 35

    defaultConfig {
        applicationId = "cl.tele.tv"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    signingConfigs {
        if (keystoreProps.isNotEmpty()) {
            create("release") {
                storeFile = file(keystoreProps.getProperty("storeFile"))
                storePassword = keystoreProps.getProperty("storePassword")
                keyAlias = keystoreProps.getProperty("keyAlias")
                keyPassword = keystoreProps.getProperty("keyPassword")
            }
        }
    }

    buildFeatures {
        buildConfig = true
    }

    buildTypes {
        debug {
            buildConfigField("String", "TELE_URL", "\"$teleUrl\"")
        }
        release {
            isMinifyEnabled = false
            buildConfigField("String", "TELE_URL", "\"$teleReleaseUrl\"")
            signingConfig = signingConfigs.findByName("release")
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
