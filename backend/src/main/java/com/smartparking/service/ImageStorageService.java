package com.smartparking.service;

import com.smartparking.exception.NotFoundException;
import com.smartparking.entity.ImageDirectoryType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImageStorageService {

    private final Path rootLocation = Paths.get("uploaded-images");
    private String basePath = "D:\\Infosys\\upload";

    public ImageStorageService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    public String store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.rootLocation.resolve(filename));
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
        }
    }

    public String saveFile(MultipartFile file, Long ownerId, ImageDirectoryType type) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // Use local system path as requested by user
            Path path = Paths.get(
                    basePath,
                    type.getFolderName(),
                    ownerId.toString(),
                    "images");

            Files.createDirectories(path);

            String originalFileName = file.getOriginalFilename();
            String cleanFileName = Paths.get(originalFileName).getFileName().toString();
            String extension = "";
            int dotIndex = cleanFileName.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = cleanFileName.substring(dotIndex);
            }

            String newFileName = UUID.randomUUID() + extension;
            Path filePath = path.resolve(newFileName);

            Files.copy(
                    file.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING);

            // Return the static resource URL path
            // Map /uploads/** to the local file system D:\\Infosys\\upload\\
            return "/uploads/" + type.getFolderName() + "/" + ownerId + "/images/" + newFileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), e);
        }
    }

    public Resource loadAsResource(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + filename, e);
        }
    }
}
