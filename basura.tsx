// model VerificationToken {
//   id        String     @id @default(cuid())
//   userId    String
//   token     String     @unique
//   type      TokenType
//   expiresAt DateTime
//   isUsed    Boolean    @default(false)
//   usedAt    DateTime?
//   metadata  Json?
//   createdAt DateTime   @default(now())
//   updatedAt DateTime   @updatedAt

//   user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@index([userId])    // ← Agregado índice
//   @@index([expiresAt]) // ← Agregado índice
//   @@index([type])      // ← Agregado índice
//   @@map("verification_tokens")
// }