package com.example.englishlearn.exception;

public class DuplicateWordException extends RuntimeException {
    public DuplicateWordException(String message) {
        super(message);
    }
}
