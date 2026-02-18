package com.example.englishlearn.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "words", uniqueConstraints = {
        @UniqueConstraint(name = "uk_words_english", columnNames = "english")
})
public class Word {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String english;

    @Column(nullable = false)
    private String portuguese;

    @Column(name = "part_of_speech")
    private String partOfSpeech;

    protected Word() {
    }

    public Word(String english, String portuguese, String partOfSpeech) {
        this.english = english;
        this.portuguese = portuguese;
        this.partOfSpeech = partOfSpeech;
    }

    public Long getId() {
        return id;
    }

    public String getEnglish() {
        return english;
    }

    public void setEnglish(String english) {
        this.english = english;
    }

    public String getPortuguese() {
        return portuguese;
    }

    public void setPortuguese(String portuguese) {
        this.portuguese = portuguese;
    }

    public String getPartOfSpeech() {
        return partOfSpeech;
    }

    public void setPartOfSpeech(String partOfSpeech) {
        this.partOfSpeech = partOfSpeech;
    }
}
