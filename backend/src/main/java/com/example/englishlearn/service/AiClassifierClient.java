package com.example.englishlearn.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class AiClassifierClient {
    private final RestTemplate restTemplate;
    private final String serviceUrl;

    public AiClassifierClient(RestTemplateBuilder restTemplateBuilder,
            @Value("${ai.service.url}") String serviceUrl) {
        this.restTemplate = restTemplateBuilder.build();
        this.serviceUrl = serviceUrl;
    }

    public String classify(String englishWord) {
        try {
            ClassifyResponse response = restTemplate.postForObject(
                    serviceUrl,
                    new ClassifyRequest(englishWord),
                    ClassifyResponse.class
            );
            if (response == null || response.partsOfSpeech() == null || response.partsOfSpeech().isBlank()) {
                return "unknown";
            }
            return response.partsOfSpeech().trim();
        } catch (RestClientException ex) {
            return "unknown";
        }
    }

    private record ClassifyRequest(String word) {
    }

    private record ClassifyResponse(String partsOfSpeech) {
    }
}
