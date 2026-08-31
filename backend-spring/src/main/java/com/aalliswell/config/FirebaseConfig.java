package com.aalliswell.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import java.io.FileInputStream;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@ConditionalOnProperty(name = "app.firebase.enabled", havingValue = "true")
public class FirebaseConfig {

    @Bean
    public FirebaseApp firebaseApp(
            @Value("${app.firebase.credentials-path:}") String credentialsPath,
            @Value("${app.firebase.project-id:}") String projectId
    ) throws IOException {
        try {
            return FirebaseApp.getInstance();
        } catch (IllegalStateException ignored) {
            GoogleCredentials credentials = googleCredentials(credentialsPath);
            FirebaseOptions.Builder options = FirebaseOptions.builder().setCredentials(credentials);
            if (StringUtils.hasText(projectId)) {
                options.setProjectId(projectId.trim());
            }
            return FirebaseApp.initializeApp(options.build());
        }
    }

    @Bean
    public FirebaseMessaging firebaseMessaging(FirebaseApp firebaseApp) {
        return FirebaseMessaging.getInstance(firebaseApp);
    }

    private GoogleCredentials googleCredentials(String credentialsPath) throws IOException {
        if (!StringUtils.hasText(credentialsPath)) {
            return GoogleCredentials.getApplicationDefault();
        }
        try (FileInputStream stream = new FileInputStream(credentialsPath.trim())) {
            return GoogleCredentials.fromStream(stream);
        }
    }
}
