package com.example.englishlearn.controller;

import com.example.englishlearn.model.Word;
import com.example.englishlearn.service.WordService;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/words")
@CrossOrigin(origins = "http://localhost:4200")
public class WordController {
    private final WordService wordService;

    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    @GetMapping
    public List<Word> listWords() {
        return wordService.listWords();
    }

    @PostMapping
    public Word createWord(@RequestBody WordRequest request) {
        return wordService.createWord(request.english(), request.portuguese());
    }

    @PutMapping("/{id}")
    public Word updateWord(@PathVariable Long id, @RequestBody WordRequest request) {
        return wordService.updateWord(id, request.english(), request.portuguese());
    }

    @DeleteMapping("/{id}")
    public void deleteWord(@PathVariable Long id) {
        wordService.deleteWord(id);
    }

    public record WordRequest(String english, String portuguese) {
    }
}
