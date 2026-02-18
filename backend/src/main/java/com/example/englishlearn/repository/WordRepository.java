package com.example.englishlearn.repository;

import com.example.englishlearn.model.Word;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordRepository extends JpaRepository<Word, Long> {
    Optional<Word> findByEnglish(String english);
}
