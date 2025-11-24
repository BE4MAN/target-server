package com.target.global.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/sysone-example")
@Slf4j
public class SysoneExampleController {

    @GetMapping(produces = MediaType.TEXT_HTML_VALUE)
    public String getSysoneExample() {
        try {
            Resource resource = new ClassPathResource("static/sysone-example.html");
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            log.error("Failed to load sysone-example.html", e);
            return "<html><body><h1>Error loading page</h1><p>" + e.getMessage() + "</p></body></html>";
        }
    }
}

