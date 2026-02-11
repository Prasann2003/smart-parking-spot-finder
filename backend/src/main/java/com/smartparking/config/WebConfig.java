package com.smartparking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /uploads/** to the local file system D:\\Infosys\\upload\\
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///D:/Infosys/upload/");
    }
}
