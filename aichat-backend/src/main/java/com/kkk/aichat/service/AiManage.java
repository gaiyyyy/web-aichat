package com.kkk.aichat.service;

import com.volcengine.ark.runtime.model.bot.completion.chat.BotChatCompletionRequest;
import com.volcengine.ark.runtime.model.bot.completion.chat.BotChatCompletionResult;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessage;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessageRole;
import com.volcengine.ark.runtime.service.ArkService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiManage {

    @Resource
    private ArkService arkService;

    //传入系统prompt，用户prompt；
    public String doChat(String systemPrompt, String userPrompt) {
        final List<ChatMessage> messages = new ArrayList<>();
        final ChatMessage systemMessage = ChatMessage.builder().role(ChatMessageRole.SYSTEM).content(systemPrompt).build();
        final ChatMessage userMessage = ChatMessage.builder().role(ChatMessageRole.USER).content(userPrompt).build();
        messages.add(systemMessage);
        messages.add(userMessage);

        return doChat(messages);

//        BotChatCompletionRequest chatCompletionRequest = BotChatCompletionRequest.builder()
//                .botId("bot-20251201190601-h4jd4")
//                .messages(messages)
//                .build();
//
//        BotChatCompletionResult chatCompletionResult =  arkService.createBotChatCompletion(chatCompletionRequest);
//        //chatCompletionResult.getChoices().forEach(choice -> System.out.println(choice.getMessage().getContent()));
//
//
//
//
////        arkService.shutdownExecutor();
//
//        if(chatCompletionResult.getChoices() != null && !chatCompletionResult.getChoices().isEmpty()) {
////            return "没有返回结果";
//            return (String)chatCompletionResult.getChoices().get(0).getMessage().getContent();
////            throw new RuntimeException("AI没有返回结果");
//        }
//
////        return (String)chatCompletionResult.getChoices().get(0).getMessage().getContent();
////        return doChat(messages);
//        return "no answer from AI";
    }


    //允许用户传入任意条消息;
    public String doChat(List<ChatMessage> messages) {
//        final List<ChatMessage> messages = new ArrayList<>();
//        final ChatMessage systemMessage = ChatMessage.builder().role(ChatMessageRole.SYSTEM).content(systemPrompt).build();
//        final ChatMessage userMessage = ChatMessage.builder().role(ChatMessageRole.USER).content(userPrompt).build();
//        messages.add(systemMessage);
//        messages.add(userMessage);

        if (messages == null || messages.isEmpty()) {
            return "消息列表为空，无法生成回复";
        }
        BotChatCompletionRequest chatCompletionRequest = BotChatCompletionRequest.builder()
                .botId("bot-20251201190601-h4jd4")
                .messages(messages)
                .build();

        BotChatCompletionResult chatCompletionResult =  arkService.createBotChatCompletion(chatCompletionRequest);
        //chatCompletionResult.getChoices().forEach(choice -> System.out.println(choice.getMessage().getContent()));


        if(chatCompletionResult.getChoices() != null && !chatCompletionResult.getChoices().isEmpty()) {
            //return "没有返回结果";
//            throw new RuntimeException("AI没有返回结果");
            return (String)chatCompletionResult.getChoices().get(0).getMessage().getContent();
        }
//        return (String)chatCompletionResult.getChoices().get(0).getMessage().getContent();
        return "no answer from AI";
    }

//
}

