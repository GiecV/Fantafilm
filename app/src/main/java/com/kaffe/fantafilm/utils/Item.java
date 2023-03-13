package com.kaffe.fantafilm.utils;

import java.util.List;

public class Item {

    private String description;
    private String bonus;
    private List<String> tags;
    private Level level;
    private List<String> categories;

    public Item(String description, String bonus, List<String> tags, Level level, List<String> categories) {
        this.description = description;
        this.bonus = bonus;
        this.tags = tags;
        this.level = level;
        this.categories = categories;
    }

    public String getDescription() {
        return description;
    }

    public String getBonus() {
        return bonus;
    }

    public List<String> getTags() {
        return tags;
    }

    public Level getLevel() {
        return level;
    }

    public List<String> getCategories() {
        return categories;
    }
}