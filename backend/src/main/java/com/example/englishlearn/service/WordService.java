package com.example.englishlearn.service;

import com.example.englishlearn.exception.DuplicateWordException;
import com.example.englishlearn.exception.WordNotFoundException;
import com.example.englishlearn.model.Word;
import com.example.englishlearn.repository.WordRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WordService {
    private final WordRepository wordRepository;
    private final AiClassifierClient aiClassifierClient;

    public WordService(WordRepository wordRepository, AiClassifierClient aiClassifierClient) {
        this.wordRepository = wordRepository;
        this.aiClassifierClient = aiClassifierClient;
    }

    public List<Word> listWords() {
        return wordRepository.findAll();
    }

    @Transactional
    public Word createWord(String english, String portuguese) {
        String normalizedEnglish = normalize(english);
        String normalizedPortuguese = normalize(portuguese);

        if (normalizedEnglish.isEmpty() || normalizedPortuguese.isEmpty()) {
            throw new IllegalArgumentException("English and Portuguese words are required.");
        }

        if (wordRepository.findByEnglish(normalizedEnglish).isPresent()) {
            throw new DuplicateWordException("Word already exists.");
        }

        String partOfSpeech = aiClassifierClient.classify(normalizedEnglish);
        Word word = new Word(normalizedEnglish, normalizedPortuguese, partOfSpeech);
        return wordRepository.save(word);
    }

    @Transactional
    public Word updateWord(Long id, String english, String portuguese) {
        String normalizedEnglish = normalize(english);
        String normalizedPortuguese = normalize(portuguese);

        if (normalizedEnglish.isEmpty() || normalizedPortuguese.isEmpty()) {
            throw new IllegalArgumentException("English and Portuguese words are required.");
        }

        Word existing = wordRepository.findById(id)
                .orElseThrow(() -> new WordNotFoundException("Word not found."));

        Optional<Word> conflict = wordRepository.findByEnglish(normalizedEnglish);
        if (conflict.isPresent() && !conflict.get().getId().equals(existing.getId())) {
            throw new DuplicateWordException("Word already exists.");
        }

        String partOfSpeech = aiClassifierClient.classify(normalizedEnglish);
        existing.setEnglish(normalizedEnglish);
        existing.setPortuguese(normalizedPortuguese);
        existing.setPartOfSpeech(partOfSpeech);
        return wordRepository.save(existing);
    }

    @Transactional
    public void deleteWord(Long id) {
        Word existing = wordRepository.findById(id)
                .orElseThrow(() -> new WordNotFoundException("Word not found."));
        wordRepository.delete(existing);
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toLowerCase();
    }
}
